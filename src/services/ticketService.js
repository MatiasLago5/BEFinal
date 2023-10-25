const Ticket = require("../models/ticket");

const TicketService = {
  createTicket: async (ticketData) => {
    try {
      const newTicket = new Ticket({
        ...ticketData,
      });
      const savedTicket = await newTicket.save();
      return savedTicket;
    } catch (error) {
      throw new Error("Error al crear el ticket: " + error);
    }
  },
  getUserTickets: async (userId) => {
    try {
      const tickets = await Ticket.find({ purchaser: userId });
      return tickets;
    } catch (error) {
      throw new Error("Error al obtener los tickets del usuario: " + error);
    }
  },
};

module.exports = TicketService;
