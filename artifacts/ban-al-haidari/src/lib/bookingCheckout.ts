import { API_BASE } from "@/lib/apiBase";

interface BookingCourse {
  id: string;
  title: string;
  price: number;
  image?: string;
  description?: string;
}

export async function startBookingCheckout(course: BookingCourse): Promise<void> {
  const response = await fetch(`${API_BASE}/checkout/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      courseId: course.id,
      courseType: "online",
      title: course.title,
      price: course.price,
      image: course.image ?? "",
      description: course.description ?? "",
      requiresScheduling: true,
    }),
  });

  if (!response.ok) {
    throw new Error("checkout-failed");
  }

  const data = (await response.json()) as { url?: string };
  if (!data.url) {
    throw new Error("checkout-failed");
  }

  window.location.assign(data.url);
}