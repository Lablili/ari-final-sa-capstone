using System.Collections.Concurrent;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using ari_final_sa_capstone.Data;
using ari_final_sa_capstone.Models;

namespace ari_final_sa_capstone.Hubs
{
    [Authorize(Roles = "SuperAdmin,BantayDagatAdmin,FisheriesAdmin")]
    public class AdminChatHub : Hub
    {
        private readonly ApplicationDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;

        // Tracks online users: key = UserId, value = role
        private static readonly ConcurrentDictionary<string, string> OnlineUsers = new();

        public AdminChatHub(ApplicationDbContext db, UserManager<ApplicationUser> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        public override async Task OnConnectedAsync()
        {
            var user = await _userManager.GetUserAsync(Context.User);
            if (user != null)
            {
                var roles = await _userManager.GetRolesAsync(user);
                var role = roles.FirstOrDefault() ?? "";
                OnlineUsers[user.Id] = role;

                await Clients.All.SendAsync("UserOnline", user.Id, user.FullName, role);
            }
            
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var user = await _userManager.GetUserAsync(Context.User);
            if (user != null)
            {
                OnlineUsers.TryRemove(user.Id, out _);
                await Clients.All.SendAsync("UserOffline", user.Id);
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(string messageContent, string messageType, int? resourceId = null, string resourceType = null, string resourceTitle = null)
        {
            var user = await _userManager.GetUserAsync(Context.User);
            if (user == null) return;

            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.FirstOrDefault() ?? "";

            var message = new AdminMessage
            {
                SenderAdminID = user.Id,
                SenderRole = role,
                MessageContent = messageContent,
                MessageType = messageType,
                Timestamp = DateTime.UtcNow
            };

            _db.AdminMessages.Add(message);
            await _db.SaveChangesAsync();

            var attachmentsList = new List<object>();

            if (resourceId.HasValue && !string.IsNullOrEmpty(resourceType))
            {
                var attachment = new AdminMessageAttachment
                {
                    MessageID = message.MessageID,
                    ResourceID = resourceId.Value,
                    ResourceType = resourceType,
                    ResourceTitle = resourceTitle ?? string.Empty
                };
                _db.AdminMessageAttachments.Add(attachment);
                await _db.SaveChangesAsync();

                attachmentsList.Add(new {
                    ResourceType = attachment.ResourceType,
                    ResourceID = attachment.ResourceID,
                    ResourceTitle = attachment.ResourceTitle
                });
            }

            // Broadcast to all connected admins
            await Clients.All.SendAsync("ReceiveMessage", new 
            {
                id = message.MessageID,
                senderId = user.Id,
                senderName = user.FullName,
                senderRole = role,
                content = messageContent,
                type = messageType,
                timestamp = message.Timestamp.ToString("O"),
                attachments = attachmentsList
            });
        }
        public async Task SendTypingIndicator()
        {
            var user = await _userManager.GetUserAsync(Context.User);
            if (user != null)
            {
                var roles = await _userManager.GetRolesAsync(user);
                await Clients.Others.SendAsync("UserTyping", user.Id, roles.FirstOrDefault() ?? "Admin");
            }
        }
    }
}
