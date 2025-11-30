// src/components/Breadcrumbs.tsx
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumbs() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    return (
        <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
                <li>
                    <div className="flex items-center">
                        <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
                            Home
                        </Link>
                    </div>
                </li>
                {pathnames.map((name, index) => {
                    const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathnames.length - 1;
                    return (
                        <li key={name} className="flex items-center">
                            <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                            {isLast ? (
                                <span className="text-sm font-medium text-gray-700">
                                    {name.split('-').map(word =>
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                </span>
                            ) : (
                                <Link to={routeTo} className="text-sm text-gray-500 hover:text-gray-700">
                                    {name.split('-').map(word =>
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}