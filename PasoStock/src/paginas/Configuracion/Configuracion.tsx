import { Icon } from '../../componentes/Icon';
import type { FormEventHandler } from 'react';
import type { User } from 'firebase/auth';

interface SettingsProps {
    user: User;
    profileName: string;
    compactView: boolean;
    darkMode: boolean;
    saving: boolean;
    onSubmit: FormEventHandler<HTMLFormElement>;
}

export default function Settings({ user, profileName, compactView, darkMode, saving, onSubmit }: SettingsProps) {
    const canChangePassword = user.providerData.some((provider) => provider.providerId === 'password');
    return (
        <section className="settings-grid">
            <form className="panel settings-panel" onSubmit={onSubmit}>
                <div className="panel-heading settings-heading">
                    <div>
                        <h2>Perfil de usuario</h2>
                        <p>El nombre se actualiza en Firebase Authentication.</p>
                    </div>
                    <span className="settings-icon"><Icon name="users" /></span>
                </div>
                <label className="field">
                    Nombre visible
                    <input name="displayName" required maxLength={80} defaultValue={profileName} placeholder="Tu nombre" />
                </label>
                <label className="field">
                    Correo electrónico
                    <input value={user.email ?? ''} readOnly />
                </label>
                <div className="settings-divider" />
                <div className="panel-heading settings-heading">
                    <div>
                        <h2>Preferencias visuales</h2>
                        <p>Estas preferencias se guardan en este navegador para tu cuenta.</p>
                    </div>
                    <span className="settings-icon"><Icon name="settings" /></span>
                </div>
                <label className="preference-option">
                    <span>
                        <strong>Vista compacta</strong>
                        <small>Reduce el espacio de las tablas para mostrar más filas.</small>
                    </span>
                    <input name="compactView" type="checkbox" defaultChecked={compactView} />
                </label>
                <label className="preference-option">
                    <span>
                        <strong>Modo oscuro</strong>
                        <small>Usa colores oscuros en las pantallas del inventario para reducir el brillo.</small>
                    </span>
                    <input name="darkMode" type="checkbox" defaultChecked={darkMode} />
                </label>
                <div className="settings-actions">
                    <button className="button button-primary" disabled={saving}>
                        <Icon name="check" />
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </div>
            </form>
            {canChangePassword ? (
                <form className="panel settings-panel" onSubmit={onSubmit}>
                    <div className="panel-heading settings-heading">
                        <div>
                            <h2>Cambiar contraseña</h2>
                            <p>Confirma tu contraseña actual para establecer una nueva.</p>
                        </div>
                        <span className="settings-icon"><Icon name="lock" /></span>
                    </div>
                    <label className="field">
                        Contraseña actual
                        <input name="currentPassword" type="password" autoComplete="current-password" required />
                    </label>
                    <label className="field">
                        Nueva contraseña
                        <input name="newPassword" type="password" autoComplete="new-password" minLength={6} required />
                    </label>
                    <label className="field">
                        Confirmar nueva contraseña
                        <input name="confirmPassword" type="password" autoComplete="new-password" minLength={6} required />
                    </label>
                    <div className="settings-actions">
                        <button className="button button-primary" disabled={saving}>
                            <Icon name="check" />
                            {saving ? 'Actualizando...' : 'Cambiar contraseña'}
                        </button>
                    </div>
                </form>
            ) : (
                <section className="panel settings-panel">
                    <div className="panel-heading settings-heading">
                        <div>
                            <h2>Contraseña</h2>
                            <p>Esta cuenta usa un proveedor externo para iniciar sesión. Administra la contraseña desde ese proveedor.</p>
                        </div>
                        <span className="settings-icon"><Icon name="lock" /></span>
                    </div>
                </section>
            )}
        </section>
    );
}
