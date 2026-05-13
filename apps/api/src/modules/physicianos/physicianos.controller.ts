import { Controller } from "@nestjs/common";
import { PhysicianosService } from "./physicianos.service";

@Controller("physicianos")
export class PhysicianosController {
  constructor(private readonly physicianosService: PhysicianosService) {}
}
