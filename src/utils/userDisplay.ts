export function displayUserName(profileName: string, email?: string | null): string {
    const emailName = email
        ?.split('@')[0]
        ?.split(/[._-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toLocaleUpperCase('es') + part.slice(1))
        .join(' ');

    return profileName.trim() || emailName || 'Usuario';
}
