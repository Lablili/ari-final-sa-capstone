using System.Threading.Tasks;

namespace ari_final_sa_capstone.Services
{
    public interface IEmailSender
    {
        Task SendEmailAsync(string email, string subject, string htmlMessage);
    }
}
