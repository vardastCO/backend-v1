import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosError, AxiosResponse } from "axios";
import { catchError, firstValueFrom } from "rxjs";
import { filterObject } from "../utilities/helpers";

@Injectable()
export class KavenegarService {
  private smsServiceEnabled: boolean;
  private apiKey: string;
  private baseAddress = "https://api.kavenegar.com/v1";
  private logger = console;

  constructor(
    configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiKey = configService.get("SMS_KAVENEGAR_API_KEY");
    this.smsServiceEnabled = configService.get("SMS_ENABLED") == "true";
    console.log(this.smsServiceEnabled);
  }

  async send(
    receptor: string,
    message: string,
    sender?: string,
    sendAt?: number, // date
    type?: 0 | 1 | 2 | 3,
    localid?: number,
    hide?: boolean,
  ) {
    const date = sendAt;

    return await this.request(
      "sms/send.json",
      filterObject({
        receptor,
        message,
        sender,
        sendAt,
        type,
        localid,
        hide,
        date,
      }),
    );
  }

  async lookup(
    receptor: string,
    template: string,
    token: string,
    token2?: string,
    token3?: string,
    type?: "sms" | "voice",
  ) {
    try {
      await this.request(
        "verify/lookup.json",
        filterObject({
          receptor,
          template,
          token,
          token2,
          token3,
          type,
        }),
      );
    } catch (e) {
      console.log('look up kavenegar ',e )
    } 
    
  }

  async request(
    endpoint: string,
    body: object,
  ): Promise<AxiosResponse<object>> {
    if (!this.smsServiceEnabled) {
      console.log("SMS disabled, tried to send sms:", endpoint, body);
      return;
    }

    const url = `${this.baseAddress.replace(/\/+$/, "")}/${
      this.apiKey
    }/${endpoint.replace(/^\/+/, "")}`;

    const response = await firstValueFrom(
      this.httpService
        .post(url, null, {
          params: body,
        })
        .pipe(
          catchError((error: AxiosError) => {
           console.log(url, body, error);
            throw "An error happened while calling sms provider api!";
          }),
        ),
    );
    // console.log('res kavenegar',response)
    // if (response?.data?.return?.status !== 200) {
    //   this.logger.error(url, body, response);
    //   throw "Unsuccessful call of sms provider API!";
    // }

    return response;
  }
}
