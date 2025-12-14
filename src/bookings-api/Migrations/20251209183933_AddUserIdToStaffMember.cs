using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace bookings_api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToStaffMember : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "StaffMembers",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserId",
                table: "StaffMembers");
        }
    }
}
