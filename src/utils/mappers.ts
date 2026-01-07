export const getQueueName = (queueId: number) => {
  switch (queueId) {
    case 420: return "Ranked Solo";
    case 440: return "Ranked Flex";
    case 400: return "Draft Pick";
    case 430: return "Blind Pick";
    case 450: return "ARAM";
    default: return "Normal";
  }
};