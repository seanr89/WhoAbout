using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace bookings_api.Migrations
{
    /// <inheritdoc />
    public partial class AddDeskReservation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ReservedForStaffMemberId",
                table: "Desks",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Desks_ReservedForStaffMemberId",
                table: "Desks",
                column: "ReservedForStaffMemberId");

            migrationBuilder.AddForeignKey(
                name: "FK_Desks_StaffMembers_ReservedForStaffMemberId",
                table: "Desks",
                column: "ReservedForStaffMemberId",
                principalTable: "StaffMembers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Desks_StaffMembers_ReservedForStaffMemberId",
                table: "Desks");

            migrationBuilder.DropIndex(
                name: "IX_Desks_ReservedForStaffMemberId",
                table: "Desks");

            migrationBuilder.DropColumn(
                name: "ReservedForStaffMemberId",
                table: "Desks");
        }
    }
}
