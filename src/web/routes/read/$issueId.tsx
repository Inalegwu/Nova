import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/read/$issueId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/read/$issueId"!</div>
}
