import { ExceptionFilter, Catch, NotFoundException, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import axios from 'axios';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  async catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    try {
      // Fetch HTML content from the external URL
      const htmlResponse = await axios.get('http://storage.vardast.com/vardast/404.html');
      const htmlContent = htmlResponse.data;
      // Send the HTML content as the response
      response.status(404).send(htmlContent);
    } catch (error) {
      console.error('Error fetching HTML:', error);
      // If fetching HTML fails, send a simple error message
      response.status(404).send('Custom 404 page not found');
    }
  }
}
