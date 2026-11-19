import Navigation from './Navigation';
import { Icon } from '../componentes/Icon';
import type { User } from 'firebase/auth';
import type { PageView, Product } from '../types';

interface SidebarProps {
    view: PageView;
    lowStock: Product[];
    profileName: string;
    user: User;
    handleSignOut: () => void;
    onNavigate: (view: PageView) => void;
}

export default function Sidebar({ view, lowStock, profileName, user, handleSignOut, onNavigate }: SidebarProps) {
    return (
        <aside className="sidebar">
            <div className="brand">
                <div className="brand-mark">
                    <img src="/pasostock-mark.svg" alt="" />
                </div>
                <div>
                    <strong>PasoStock</strong>
                    <span>CONTROL DE INVENTARIO</span>
                </div>
            </div>
            <div className="side-label">MENÚ PRINCIPAL</div>
            <Navigation view={view} lowStock={lowStock} onNavigate={onNavigate} />
            <button type="button" className="mobile-signout-button" aria-label="Cerrar sesión" onClick={handleSignOut}>
                <Icon name="logout" />
                <span>Salir</span>
            </button>
            <div className="sidebar-bottom">
                <div className="user-profile">
                    <div className="avatar">{(profileName || user.email || 'U').slice(0, 1).toUpperCase()}</div>
                    <div>
                        <strong>{profileName || user.email}</strong>
                        <span>Sesión autenticada</span>
                    </div>
                    <button className="signout-button" onClick={handleSignOut}>Salir</button>
                </div>
            </div>
        </aside>
    );
}
