import type { KeyboardEvent } from "react";
import { motion } from "motion/react";
import { ProjectLogo } from "../../ProjectLogo";
const SERVICES = ["Web Design"] as const;
type StepServiceProps = {
  selectedService: string | null;
  onSelectService: (service: string) => void;
};
const handleKeyDown = (event: KeyboardEvent, action: () => void) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    action();
  }
};
export function StepService({
  selectedService,
  onSelectService,
}: StepServiceProps) {
  return (
    <>
      <motion.div
        initial={{ y: 6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.35 }}
        className="mb-6 w-full"
      >
        <div className="flex flex-col font-app font-medium justify-center leading-none min-h-px min-w-px relative txt-tone-primary txt-role-body-lg mb-2">
          <p className="txt-leading-body whitespace-pre-wrap">Solutions</p>
        </div>
        <div className="flex flex-col font-app font-normal justify-center leading-none relative shrink-0 txt-role-body-md txt-tone-subtle w-full">
          <p className="txt-leading-body whitespace-pre-wrap">
            Choose the service that fits your needs.
          </p>
        </div>
      </motion.div>
      <div className="flex flex-wrap gap-4 w-full mb-8">
        {SERVICES.map((service, idx) => (
          <motion.div
            key={service}
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.12 + idx * 0.05, duration: 0.3 }}
            onClick={() => onSelectService(service)}
            role="button"
            tabIndex={0}
            onKeyDown={(event: KeyboardEvent) =>
              handleKeyDown(event, () => onSelectService(service))
            }
            className={` content-stretch flex gap-[8px] h-[36px] items-center px-[14px] relative rounded-full shrink-0 cursor-pointer transition-all border outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${selectedService === service ? "bg-white/10 border-white/20 text-white" : "bg-transparent border-transparent hover:bg-white/5 txt-tone-primary"} `}
          >
            <ProjectLogo size={16} category={service} />
            <div className="flex flex-col font-app font-medium justify-center leading-none relative shrink-0 txt-role-body-lg whitespace-nowrap">
              <p className="txt-leading-body">{service}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}
