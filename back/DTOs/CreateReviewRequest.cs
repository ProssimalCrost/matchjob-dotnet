using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace MatchJob.DTOs
{
    public class CreateReviewRequest
    {
        [Required]
        public Guid ProfessionalProfileId { get; set; }

        [Range(1, 5)]
        public int Rating { get; set;}

        [MaxLength(500)]
        public string? Comment { get; set;}
    }
}