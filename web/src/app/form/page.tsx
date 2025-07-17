import { auth } from "@/configuration/auth";
import { redirect } from "next/navigation";
import FormComponent from "@/components/FormComponent";
import { Suspense } from "react";
import React from "react";

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Not sure if Suspence works
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FormComponent />
    </Suspense>
  );
}
