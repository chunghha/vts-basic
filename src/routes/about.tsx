import { createFileRoute } from '@tanstack/react-router'
import { ROUTES } from '../enums/routes.enum'
import About from '../pages/about'

export const Route = createFileRoute(`${ROUTES.ABOUT}`)({
	component: About,
})
