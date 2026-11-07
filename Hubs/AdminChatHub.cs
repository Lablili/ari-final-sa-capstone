using System.Collections.Concurrent;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using ari_final_sa_capstone.Data;
using ari_final_sa_capstone.Models;

namespace ari_final_sa_capstone.Hubs
{
    public class OnlineAdminUser
    {
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public HashSet<string> ConnectionIds { get; } = new();
    }

    [Authorize(Roles = "SuperAdmin,BantayDagatAdmin,FisheriesAdmin")]
    public class AdminChatHub : Hub
    {
        private readonly ApplicationDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;

        // Tracks online users: key = UserId, value = OnlineAdminUser object
        private static readonly ConcurrentDictionary<string, OnlineAdminUser> OnlineUsers = new();

        public AdminChatHub(ApplicationDbContext db, UserManager<ApplicationUser> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        public static List<object> GetActiveAdminsList()
        {
            return OnlineUsers.Values.Select(u => (object)new
            {
                userId = u.UserId,
                userName = u.UserName,
                role = u.Role
            }).ToList();
        }

        public override async Task OnConnectedAsync()
        {
            var user = await _userManager.GetUserAsync(Context.User);
            if (user != null)
            {
                var roles = await _userManager.GetRolesAsync(user);
                var role = roles.FirstOrDefault() ?? "Admin";
                var displayName = !string.IsNullOrWhiteSpace(user.FullName) ? user.FullName : (user.UserName ?? "Admin");

                var adminInfo = OnlineUsers.GetOrAdd(user.Id, _ => new OnlineAdminUser
                {
                    UserId = user.Id,
                    UserName = displayName,
                    Role = role
                });

                bool isFirstConnection = false;
                lock (adminInfo.ConnectionIds)
                {
                    isFirstConnection = adminInfo.ConnectionIds.Count == 0;
                    adminInfo.ConnectionIds.Add(Context.ConnectionId);
                    adminInfo.UserName = displayName;
                    adminInfo.Role = role;
                }

                // Send the full list of currently online users to the connecting client
                var currentList = OnlineUsers.Values.Select(u => new
                {
                    userId = u.UserId,
                    userName = u.UserName,
                    role = u.Role
                }).ToList();

                await Clients.Caller.SendAsync("OnlineUsersList", currentList);

                // Broadcast to other admins that this user has joined
                if (isFirstConnection)
                {
                    await Clients.Others.SendAsync("UserOnline", user.Id, displayName, role);
                }
            }
            
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var user = await _userManager.GetUserAsync(Context.User);
            if (user != null)
            {
                if (OnlineUsers.TryGetValue(user.Id, out var adminInfo))
                {
                    bool isCompletelyOffline = false;
                    lock (adminInfo.ConnectionIds)
                    {
                        adminInfo.ConnectionIds.Remove(Context.ConnectionId);
                        if (adminInfo.ConnectionIds.Count == 0)
                        {
                            OnlineUsers.TryRemove(user.Id, out _);
                            isCompletelyOffline = true;
                        }
                    }

                    if (isCompletelyOffline)
                    {
                        await Clients.All.SendAsync("UserOffline", user.Id);
                    }
                }
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task RequestOnlineUsers()
        {
            var currentList = OnlineUsers.Values.Select(u => new
            {
                userId = u.UserId,
                userName = u.UserName,
                role = u.Role
            }).ToList();

            await Clients.Caller.SendAsync("OnlineUsersList", currentList);
        }

        public async Task SendMessage(string messageContent, string messageType, int? resourceId = null, string resourceType = null, string resourceTitle = null)
        {
            var user = await _userManager.GetUserAsync(Context.User);
            if (user == null) return;

            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.FirstOrDefault() ?? "Admin";
            var displayName = !string.IsNullOrWhiteSpace(user.FullName) ? user.FullName : (user.UserName ?? "Admin");

            var message = new AdminMessage
            {
                SenderAdminID = user.Id,
                SenderRole = role,
                MessageContent = messageContent ?? string.Empty,
                MessageType = string.IsNullOrWhiteSpace(messageType) ? "TEXT" : messageType,
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
                senderName = displayName,
                senderRole = role,
                content = message.MessageContent,
                type = message.MessageType,
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
                var displayName = !string.IsNullOrWhiteSpace(user.FullName) ? user.FullName : (user.UserName ?? "Admin");
                await Clients.Others.SendAsync("UserTyping", user.Id, displayName, roles.FirstOrDefault() ?? "Admin");
            }
        }
    }
}
