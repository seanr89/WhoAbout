using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace bookings_api.Migrations
{
    /// <inheritdoc />
    public partial class AddStaffToBooking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "StaffMemberId",
                table: "Bookings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_StaffMemberId",
                table: "Bookings",
                column: "StaffMemberId");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_StaffMembers_StaffMemberId",
                table: "Bookings",
                column: "StaffMemberId",
                principalTable: "StaffMembers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_StaffMembers_StaffMemberId",
                table: "Bookings");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_StaffMemberId",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "StaffMemberId",
                table: "Bookings");
        }
    }
}
