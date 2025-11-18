# Changelog - Améliorations de Sécurité

## ✅ Modifications effectuées

### 1. Sécurisation des identifiants et mots de passe
- ✅ Création d'un fichier `.gitignore` pour exclure les fichiers sensibles
- ✅ Modification de `application.properties` pour utiliser des variables d'environnement
- ✅ Création d'un fichier `application-dev.properties.example` comme modèle
- ✅ Tous les mots de passe et identifiants sont maintenant configurés via variables d'environnement

**Variables d'environnement à configurer :**
- `DB_PASSWORD` : Mot de passe de la base de données
- `MAIL_USERNAME` : Email pour l'envoi de mails
- `MAIL_PASSWORD` : Mot de passe d'application Gmail
- `JWT_SECRET` : Clé secrète pour JWT (à configurer lors de l'implémentation JWT)

### 2. Contrôle d'accès par utilisateur
- ✅ Modification de `TaskService` pour vérifier que chaque utilisateur ne peut accéder qu'à ses propres tâches
- ✅ Ajout de vérifications dans toutes les méthodes (get, create, update, delete)
- ✅ Création d'exceptions personnalisées : `ResourceNotFoundException` et `UnauthorizedException`
- ✅ Modification de `TaskController` pour utiliser le `userId` depuis le header `X-User-Id`
- ✅ Mise à jour de l'interceptor Angular pour envoyer automatiquement le `userId` dans les requêtes

**Fichiers modifiés :**
- `TaskService.java` : Toutes les méthodes vérifient maintenant le `userId`
- `TaskController.java` : Utilise le header `X-User-Id` pour identifier l'utilisateur
- `TaskRepository.java` : Ajout de méthodes de recherche par `userId`
- `auth.interceptor.ts` : Ajoute automatiquement le header `X-User-Id`

### 3. Validation des entrées
- ✅ Ajout d'annotations de validation dans le modèle `Task` :
  - `@NotBlank` pour le titre
  - `@NotNull` pour la difficulté, priorité et userId
- ✅ Utilisation de `@Valid` dans `TaskController` pour valider automatiquement les entrées
- ✅ Messages d'erreur en français pour une meilleure UX

### 4. Gestion centralisée des erreurs
- ✅ Création d'un `@ControllerAdvice` (`GlobalExceptionHandler`) pour gérer toutes les erreurs
- ✅ Gestion des erreurs de validation (`MethodArgumentNotValidException`)
- ✅ Gestion des ressources non trouvées (`ResourceNotFoundException`)
- ✅ Gestion des accès non autorisés (`UnauthorizedException`)
- ✅ Réponses d'erreur standardisées avec timestamp et messages clairs

### 5. Amélioration du logging
- ✅ Remplacement de `System.out.println` par SLF4J Logger
- ✅ Ajout de logs appropriés (DEBUG, INFO, WARN, ERROR) dans `TaskService` et `TaskController`
- ✅ Logs structurés pour faciliter le debugging

## ⚠️ Points d'attention

### Configuration requise
Avant de démarrer l'application, vous devez configurer les variables d'environnement :

**Option 1 : Variables d'environnement système**
```bash
export DB_PASSWORD=votre_mot_de_passe
export MAIL_USERNAME=votre_email@gmail.com
export MAIL_PASSWORD=votre_mot_de_passe_application
```

**Option 2 : Fichier application-dev.properties**
Copiez `application-dev.properties.example` vers `application-dev.properties` et remplissez les valeurs.

### Frontend
L'interceptor Angular envoie maintenant automatiquement le `userId` dans le header `X-User-Id` pour toutes les requêtes. Assurez-vous que l'utilisateur est bien connecté.

### TODO - Prochaines étapes
1. **Implémenter JWT** : Remplacer le header `X-User-Id` par l'extraction du `userId` depuis le token JWT
2. **Réactiver Spring Security** : Actuellement désactivée, à réactiver avec JWT
3. **Appliquer les mêmes améliorations** aux autres contrôleurs (Note, Schedule, Document, etc.)

## 📝 Notes de migration

### Pour les développeurs
- Les méthodes de `TaskService` nécessitent maintenant un paramètre `userId`
- Le contrôleur vérifie que le `userId` est présent dans le header
- Les erreurs sont maintenant gérées de manière centralisée et retournent des réponses JSON standardisées

### Tests à effectuer
1. Vérifier que les tâches sont bien filtrées par utilisateur
2. Tester qu'un utilisateur ne peut pas accéder aux tâches d'un autre utilisateur
3. Vérifier que les validations fonctionnent correctement
4. Tester la gestion des erreurs (ressource non trouvée, accès non autorisé)

