import { createFileRoute } from '@tanstack/react-router'
import { ROUTES } from '../enums/routes.enum'
import Home from '../pages/Home'

export const Route = createFileRoute(`${ROUTES.HOME}`)({
	component: Home,
})
