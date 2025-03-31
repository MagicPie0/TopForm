using System.ComponentModel.DataAnnotations.Schema;

namespace back_end.Models
{
    public class LoginModel
    {
        public required string Username { get; set; }

        public required string Password { get; set; }
    }
}
