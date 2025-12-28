import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/edit/$issue')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/edit/$issue"!</div>
}
