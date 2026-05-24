import { createContext, useContext, useState, useEffect, ReactNode, MouseEvent } from 'react';

interface RouterContextType {
  path: string;
  params: Record<string, string>;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType>({
  path: '/',
  params: {},
  navigate: () => {},
});

function matchRoute(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');
  if (patternParts.length !== pathParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

export function Router({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(window.location.pathname || '/');

  useEffect(() => {
    const handlePop = () => setPath(window.location.pathname || '/');
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setPath(to);
  };

  return (
    <RouterContext.Provider value={{ path, params: {}, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

interface RouteChild {
  props: { path: string; element: ReactNode };
}

export function Routes({ children }: { children: ReactNode }) {
  const ctx = useContext(RouterContext);
  const { path, navigate } = ctx;
  const childArray = (Array.isArray(children) ? children : [children]) as RouteChild[];

  for (const child of childArray) {
    if (!child?.props?.path) continue;
    const params = matchRoute(child.props.path, path);
    if (params !== null) {
      return (
        <RouterContext.Provider value={{ path, params, navigate }}>
          {child.props.element}
        </RouterContext.Provider>
      );
    }
  }
  return null;
}

export function Route(_props: { path: string; element: ReactNode }) {
  return null;
}

export function Link({
  to,
  children,
  className,
  onClick,
}: {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const { navigate } = useContext(RouterContext);
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(to);
    onClick?.();
  };
  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

export function useNavigate() {
  const { navigate } = useContext(RouterContext);
  return navigate;
}

export function useParams() {
  const { params } = useContext(RouterContext);
  return params;
}

export function useLocation() {
  const { path } = useContext(RouterContext);
  return { pathname: path };
}
