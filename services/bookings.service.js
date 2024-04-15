import query from "./db.service.js";

export async function getAllBookings() {
    console.log("querying")
  const bookings = await query(
    `SELECT * FROM Reservas`,
  );
  return bookings;
}