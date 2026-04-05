using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace bookings_api.Migrations
{
    /// <inheritdoc />
    public partial class AddFirstLoginDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "FirstLoginDate",
                table: "StaffMembers",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FirstLoginDate",
                table: "StaffMembers");
        }
    }
}
