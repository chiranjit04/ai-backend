import { v4 as uuidv4 } from "uuid";

export const uuidToBuffer = (uuid) => {
  return Buffer.from(uuid.replace(/-/g, ""), "hex");
};

export const generateUUIDBuffer = () => {
  return uuidToBuffer(uuidv4());
};