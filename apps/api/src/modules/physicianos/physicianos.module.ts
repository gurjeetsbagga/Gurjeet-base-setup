import { Module } from "@nestjs/common";
import { PhysicianosService } from "./physicianos.service";
import { PhysicianosController } from "./physicianos.controller";

/**
 * Integration boundary for PhysicianOS.
 *
 * PhysicianOS is an external system — this module communicates
 * with it exclusively through API calls. No shared database,
 * no direct model imports, no tight coupling.
 *
 * See docs/architecture/physicianos-separation.md.
 */
@Module({
  controllers: [PhysicianosController],
  providers: [PhysicianosService],
  exports: [PhysicianosService],
})
export class PhysicianosModule {}
