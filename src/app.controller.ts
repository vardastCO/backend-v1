// import { RabbitMQService } from 'src/rabitmq/rabbitmq.service'; // Adjust the path based on your project structure
// import { MessageDto } from 'src/rabitmq/Dto/message.dto';
// import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
// import { User } from './users/user/entities/user.entity';
// import { connect } from 'amqplib';
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';
// import { ElasticsearchServices } from './elastic/elastic-service';
import { Public } from "src/users/auth/decorators/public.decorator";
// import { ElasticService } from './elastic/elastic-service';
import { HealthCheckService, HttpHealthIndicator, HealthCheck } from '@nestjs/terminus';
@Public()
@Controller('health')
export class AppController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private readonly appService: AppService,
    // private readonly elasticsearchService: ElasticsearchServices,
  ) { }
  // private channel;
  // @Post()
  // async sendMessage(@Body() messageDto: MessageDto,@CurrentUser() user: User) {
  //   try {
      

  //     this.rabbitMQService.sendMessage(messageDto.chatRoomId, messageDto.senderId, messageDto.message);
    


  //     // Add logic to handle message sending, e.g., storing in a database, notifying the user, etc.
  //     return { status: 'OK' };
  //   } catch (error) {
  //     // Log any errors that occur during message sending
  //     console.error('Error sending message:', error);
  //     return { status: 'Error', error: error.message };
  //   }

  // }
  // @Get()
  // async checkHealth() {
  //   try {
  //     await this.rabbitMQService.checkConnection(); // Add a method to your RabbitMQService to check the connection
  //     return { status: 'OK' };
  //   } catch (error) {
  //     return { status: 'Error', error: error.message };
  //   }
  // }
  // @Get('user')
  // subscribeToMessages() {
  //   this.rabbitMQService.subscribeToMessages((data) => {
  //     console.log('Received message in controller:', data);
  //     // Process the message in the controller as needed
  //   });

  //   return 'Subscribed to messages';
  // }
  // @Get('count-views')
  // async countViews(): Promise<number> {
  //   const index = 'views';
  //   const body = {
  //     query: {
  //       match_all: {},
  //     },
  //   };

  //   const result = await this.elasticService.search(index, body);

  //   // Assuming your document structure has a field 'views'
  //   const totalViews = result.hits.total.value;

  //   return totalViews;
  // }
  // @Public()
  // @Post('/create-index/:index')
  // async createIndex(@Param('index') index: string): Promise<any> {
  //   return await this.elasticsearchService.createIndex(index);
  // }
  // @Public()
  // @Post('/index-document/:index')
  // async indexDocument(
  //   @Param('index') index: string,
  //   @Body() body: any,
  // ): Promise<any> {
  //   return await this.elasticsearchService.indexDocument(index, body);
  // }
  // @Public()
  // @Get('/search/:index')
  // async search(@Param('index') index: string): Promise<any> {
  //   const query = {
  //     query: {
  //       match_all: {}, // Replace with your specific query
  //     },
  //   };
  //   return await this.elasticsearchService.search(index, query);
  // }
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
    ]);
  }
  
}
