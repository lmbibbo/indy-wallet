export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Tipos permitidos
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nueva funcionalidad
        'fix',      // Corrección de bug
        'docs',     // Solo cambios en documentación
        'style',    // Cambios de formato, espaciado (sin lógica)
        'refactor', // Refactorización sin nueva feature ni fix
        'perf',     // Mejora de performance
        'test',     // Agregar o corregir tests
        'chore',    // Tareas de build, CI, dependencias
        'revert',   // Revertir un commit previo
        'build',    // Cambios en el sistema de build
        'ci',       // Cambios en CI/CD
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'subject-case': [2, 'never', ['upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
};
