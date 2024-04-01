import { Controller, Get } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { IsAlumni, ReqUser } from "src/common/decorator";

@Controller('notification')
export class NotificationController{
    constructor(private readonly notificationService: NotificationService) {}

    @IsAlumni()
    @Get()
    async getNotification(@ReqUser() request){
        const notification = await this.notificationService.getNotification(
            request.email,
        );
        return{
            message:'Successfully got all notification',
            data: notification
        }
    }


}