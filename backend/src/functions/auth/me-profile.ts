import { UserDAO } from "@/DAO/user";
import { handleErrors } from "@/utils/handle-errors";
import { Request } from "express";

export const meProfile = async (req: Request, res: any) => {
  try {
    const sub = req.userState.sub

    const dao = new UserDAO();
    const data = await dao.findOne({
      id: sub
    });

    if(!data) {
      return res.status(404).send({ message: 'User not found' });
    }

    return res.status(200).send({ data });
  } catch (err) {
    const errorMessage = handleErrors(err)

    return res.status(500).send({ message: errorMessage });
  }
}