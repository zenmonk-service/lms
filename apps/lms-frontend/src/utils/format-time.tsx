import dayjs from "dayjs";

export const formatTime = (time: string) =>
  dayjs(time, "HH:mm:ss").format("h:mm A");