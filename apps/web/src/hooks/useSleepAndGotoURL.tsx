import { useRouter } from "next/navigation";

function sleep(sleepTime: number) {
  return new Promise((resolve) => setTimeout(resolve, sleepTime * 1000));
}

export default function useSleepAndGotoURL() {
  const router = useRouter();

  return async (sleepTime: number = 2, url?: string) => {
    await sleep(sleepTime);

    if (!!url) return router.push(url);
    return location.reload();
  };
}
