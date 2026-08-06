using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace ari_final_sa_capstone.Hubs
{
    public class SmsProgressHub : Hub
    {
        public async Task JoinAnnouncementGroup(string announcementId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Announcement_{announcementId}");
        }
        
        public async Task LeaveAnnouncementGroup(string announcementId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Announcement_{announcementId}");
        }
    }
}
