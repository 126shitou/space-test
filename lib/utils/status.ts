import { GenerationStatus } from "@/types/generation";

export function traslateStatus(status: GenerationStatus) {
  switch (status) {
    case "succeed":
      return GenerationStatus.SUCCEED;
    case "failed":
      return GenerationStatus.FAILED;
    default:
      return GenerationStatus.UNKNOWN;
  }
}
