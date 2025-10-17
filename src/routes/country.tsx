import { createFileRoute } from '@tanstack/react-router'
import { ROUTES } from '../enums/routes.enum'
import Country from '../pages/country'

export const Route = createFileRoute(`${ROUTES.COUNTRY}`)({
	component: Country,
})
