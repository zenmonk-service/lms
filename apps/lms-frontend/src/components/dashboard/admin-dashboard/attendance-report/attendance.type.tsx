import z from "zod";

 
 
 export  const updateTimeSchema = z
    .object({
      check_in: z.string().min(1, "Check in required"),
      check_out: z.string().min(1, "Check out required"),
    })
    .refine(
      (data) => {
        const parseTime = (time: string) => {
          const [clock, period] = time.split(" ");
          let [hours, minutes] = clock.split(":").map(Number);

          if (period === "PM" && hours !== 12) {
            hours += 12;
          }

          if (period === "AM" && hours === 12) {
            hours = 0;
          }

          return hours * 60 + minutes;
        };

        return parseTime(data.check_out) > parseTime(data.check_in);
      },
      {
        message: "Check out must be later than check in",
        path: ["check_out"],
      },
    );


  export type UpdateTimeForm = z.infer<typeof updateTimeSchema>;