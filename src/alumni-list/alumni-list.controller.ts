import { Controller, Get } from "@nestjs/common";
import { AlumniListService } from "./alumni-list.service";
import { IsAdmin, IsAlumni, IsHead, ReqUser } from "src/common/decorator";

@Controller('alumni')
export class AlumniListController{
    constructor(private readonly alumniListService: AlumniListService){}
    
    @IsAdmin()
    @IsHead()
    @Get()
    async viewAlumni(@ReqUser() request){
        if(request.role == "ADMIN"){
            return{
                message: 'Successfully got all the alumnis',
                data: await this.alumniListService.getAllAlumni()
            }
        }
        if(request.role=='HEAD_STUDY_PROGRAM'){
            return{
                message: 'Successfully got all the alumnis',
                data: await this.alumniListService.getAllAlumnibyProdi(request.email)
            }
        }
        
    }
}