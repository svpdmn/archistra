(function initArchistraAuthUi() {
    const CLAIM_NAMESPACE = "https://archistra.app";

    function toString(value) {
        return typeof value === "string" && value.trim() ? value.trim() : null;
    }

    function toRoles(value) {
        if (!Array.isArray(value)) return [];
        return value.filter((role) => typeof role === "string" && role.trim()).map((role) => role.trim());
    }

    function readNamespacedClaim(profile, key) {
        if (!profile || typeof profile !== "object") return null;
        const namespaced = profile[`${CLAIM_NAMESPACE}/${key}`];
        return namespaced ?? null;
    }

    function normalizeAuthProfile(profile) {
        const email = toString(profile?.email);
        const orgId =
            toString(profile?.org_id) ||
            toString(readNamespacedClaim(profile, "org_id"));
        const orgName =
            toString(profile?.org_name) ||
            toString(readNamespacedClaim(profile, "org_name"));
        const directRoles = toRoles(profile?.roles);
        const namespacedRoles = toRoles(readNamespacedClaim(profile, "roles"));
        const roles = directRoles.length > 0 ? directRoles : namespacedRoles;

        return {
            isAuthenticated: true,
            email,
            orgId,
            orgName,
            roles
        };
    }

    function unauthenticatedState() {
        return {
            isAuthenticated: false,
            email: null,
            orgId: null,
            orgName: null,
            roles: []
        };
    }

    async function fetchAuthState() {
        try {
            const response = await fetch("/auth/profile", {
                method: "GET",
                credentials: "include",
                headers: {
                    Accept: "application/json"
                }
            });

            if (!response.ok) {
                return unauthenticatedState();
            }

            const profile = await response.json();
            return normalizeAuthProfile(profile);
        } catch (error) {
            console.warn("auth_profile_unavailable", error);
            return unauthenticatedState();
        }
    }

    function formatAccountLabel(authState) {
        if (!authState?.isAuthenticated) return "ACCOUNT";
        if (!authState.email) return "ACCOUNT";
        const [localPart] = authState.email.split("@");
        if (!localPart) return "ACCOUNT";
        return localPart.slice(0, 18).toUpperCase();
    }

    window.ArchistraAuthUi = {
        fetchAuthState,
        normalizeAuthProfile,
        formatAccountLabel
    };
})();
