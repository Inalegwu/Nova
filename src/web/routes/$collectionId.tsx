import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$collectionId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { collectionId } = Route.useParams();

  return <div>Hello "${collectionId}"!</div>;
}
