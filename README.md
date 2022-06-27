# Test Voting contract

## Logique de test

Dans ce test je me suis assuré que chaque fonction fonctionnait lors du ou des status dans lesquelles elles le devaient.

Ainsi nous retrouvons un describe pour chaque WorkFlowStatus contenant chacun :

  - Les tests éspérant la réponse attendu de la fonction (expect)
  - Les tests éspérant un revert de la fonction (expectRevert)
  - Les tests éspérant l'émition d'un evenement (expectEvent)
  - 

### Expect

J'ai commencé, pour chaque describe, par les expects, m'assurant ainsi que chaque fonction inclut dans le WorkFlowStatut correspondant fonctionnait. 
Pour ce qui est des guetters je les ai testé à tous les describes.


### ExpectRevert

Pour les reverts j'ai testé chaque changement vers un WorkFlowStatus n'étant pas le suivant de celui occupé, ainsi que les fonctions destinées à un autre WorkFlowStatus
et celles necessitant un modifier ou un require.


### ExpectEvent

Enfin j'ai testé que tous les evenement s'émètent correctement lorsqu'ils le devaient.

## Résultats du test


### Coverage

Je n'ai pas réussi à faire fonctionner solidity-coverage et je ne voulait pas approfondir par peur de tout casser (le plug-in ayant besoin de versions enterieurs).
Le test valide 64 it.


### Gas report

Ci-dessous un screen de eth-gas-reporter

https://drive.google.com/file/d/1E6eONlNAvIg7J4-HEVh2gRHlhY4DQ079/view?usp=sharing
