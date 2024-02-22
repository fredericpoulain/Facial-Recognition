<?php

namespace App\Security;

//use App\Entity\Users as AppUser;
use App\Entity\User;
use App\Entity\Users;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAccountStatusException;
use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class UserChecker implements UserCheckerInterface
{
    public function __construct(
        protected RequestStack $requestStack,
    ) {
    }
    /**
     * @param UserInterface $user
     * @return void
     * Cette méthode est appelée avant l’authentification d’un utilisateur.
     * Elle vérifie si l’utilisateur est une instance de Users.
     * Si ce n’est pas le cas, elle retourne immédiatement.
     * Ensuite, elle vérifie si le champ isVerified du "User" est à true. Si False,
     * elle lance une exception CustomUserMessageAccountStatusException avec
     * un message personnalisé indiquant que le compte de l’utilisateur
     * n’est pas encore activé et fournit un lien pour recevoir un nouveau mail de validation.
     */
    public function checkPreAuth(UserInterface $user): void
    {
        if (!$user instanceof User) {
            return;
        }
        $request = $this->requestStack->getCurrentRequest();
        $token = $request->get('tokenFaceRecognition');

        $session = $this->requestStack->getSession();
        $tokenCession = $session->get('tokenFaceRecognition');




        // Vérifier si le token est présent et valide
        if (!$token || !$tokenCession || $token !== $tokenCession ) {
            // Le token est incorrect ou absent, on lance une exception
            throw new CustomUserMessageAccountStatusException("Token invalide ou manquant");
        }
    }

    /**
     * @param UserInterface $user
     * @return void
     * Cette méthode est appelée après l’authentification d’un utilisateur.
     * Si à l’avenir, on a besoin d’ajouter des vérifications supplémentaires
     * après l’authentification (ex : vérifier si le compte du user a été suspendu),
     * on peut le faire dans cette méthode.
     */
    public function checkPostAuth(UserInterface $user): void
    {
//        if (!$user instanceof Users) {
//            return;
//        }

    }
}
