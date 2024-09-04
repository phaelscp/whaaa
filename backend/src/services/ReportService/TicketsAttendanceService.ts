import {FindOptions} from "sequelize/types";
import {Op} from "sequelize";
import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import ShowTicketService from "../TicketServices/ShowTicketService";
import Queue from "../../models/Queue";
import OldMessage from "../../models/OldMessage";
import User from "../../models/User";
import TicketTraking from "../../models/TicketTraking";

interface Request {
  companyId: number;
  dateStart: string;
  dateEnd: string;
}

interface TicketsAttendance {
  count: number;
  name: string;
}

interface Response {

  data: TicketsAttendance[];

}

const TicketsAttendanceService = async ({

                                          companyId,

                                          dateStart,
                                          dateEnd,

                                        }: Request): Promise<Response> => {



  const tickets = await TicketTraking.findAll({
    where: {
      companyId,
      ticketId: {
        [Op.not]: null
      },
      userId: {
        [Op.not]: null
      },
      createdAt: {
        [Op.gte]: (dateStart + " 00:00:00"),
        [Op.lte]: (dateEnd + " 23:59:59")
      }
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["name"]
      }
    ]
  });

  //group
  const data = tickets.map((ticket: any) => {
    return {
      count: ticket.length,
      name: ticket.user.name
    };
  });

  return {data};
}


export default TicketsAttendanceService;
