import {
  ExceptionFilter,
  Catch,
  NotFoundException,
  ArgumentsHost,
} from "@nestjs/common";
import { Response } from "express";
import axios from "axios";

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  async catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    try {
      const htmlResponse = await axios.get(
        "http://storage.vardast.com/vardast/404.html",
      );
      const htmlContent = htmlResponse.data;
      response.status(404).send(htmlContent);
    } catch (error) {
      response.send("Custom 404 page not found");
    }
  }
}
