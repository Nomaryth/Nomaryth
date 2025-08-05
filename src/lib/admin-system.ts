export const AdminSystem = {
    async acceptAdminInvite(inviteId: string, uid: string) {
      console.log(`Simulando aceite de convite ${inviteId} para UID ${uid}`);
      return {
        success: true,
      };
    }
  };  