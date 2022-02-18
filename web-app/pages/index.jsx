import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { Grommet } from "grommet";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push("/listings");
  }, []);
  return <Grommet />;
}
