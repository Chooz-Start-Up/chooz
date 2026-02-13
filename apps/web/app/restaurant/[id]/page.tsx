export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Restaurant</h1>
      <p>Restaurant ID: {id}</p>
      <p>Public restaurant page (SSR for SEO)</p>
    </main>
  );
}
