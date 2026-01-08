import { createFileRoute } from '@tanstack/react-router'
import { ROUTES } from '../enums/routes.enum'
import USMapPage from '../pages/us-map'

export const Route = createFileRoute(`${ROUTES.US_MAP}`)({
	component: USMapPage,
})
