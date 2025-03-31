using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back_end.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public byte[]? ProfilePicture { get; set; } // Blob a profilkép tárolására
        public required string Name { get; set; }
        public DateTime? BirthDate { get; set; }
        public byte Men { get; set; } // 0: Nő, 1: Férfi
    }


}
