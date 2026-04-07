import { Link } from 'react-router-dom'
import PortfolioImage from './PortfolioImage'
import type { Portfolio } from '../types/portfolio'

interface Props {
  portfolio: Portfolio
}

export default function PortfolioCard({ portfolio }: Props) {
  return (
    <Link
      to={`/portfolio/${portfolio.id}`}
      className="group card overflow-hidden border border-base-300/60 bg-base-100/75 shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-glow"
    >
      <figure className="relative h-56 overflow-hidden">
        <PortfolioImage
          src={portfolio.imageURL}
          alt={portfolio.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          fallbackClassName="transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-200/90">
              {portfolio.name}
            </p>
            <h3 className="text-2xl font-semibold text-white">{portfolio.title}</h3>
          </div>
          <div className="badge badge-accent badge-outline bg-white/10 text-white">
            {portfolio.skills.length} skills
          </div>
        </div>
      </figure>
      <div className="card-body gap-4">
        <div className="flex flex-wrap gap-2">
          {portfolio.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="badge badge-primary badge-outline">
              {skill}
            </span>
          ))}
        </div>
        <p className="text-sm leading-6 text-base-content/70">
          Projects: {portfolio.projects.slice(0, 2).join(' - ') || 'No projects added yet'}
        </p>
        <div className="mt-auto flex items-center justify-between text-sm text-base-content/60">
          <span>{new Date(portfolio.createdAt).toLocaleDateString()}</span>
          <span className="link link-hover text-primary">View portfolio</span>
        </div>
      </div>
    </Link>
  )
}
