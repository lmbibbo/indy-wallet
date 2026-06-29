# Reglas del Negocio — indy Wallet

## Visión General

indy es una billetera virtual con interés compuesto diario e integración con cuentas de trading MetaTrader 4 (MT4). Los usuarios pueden depositar fondos, invertir en distintas estrategias, y visualizar proyecciones de rendimiento.

---

## Casos de Uso

### 1. Autenticación

| Campo | Detalle |
|---|---|
| **Actor** | Usuario no autenticado |
| **Descripción** | El usuario se registra o inicia sesión con email y contraseña vía Firebase Auth. |
| **Flujo** | 1. Ingresa email y contraseña. 2. El sistema autentica contra Firebase. 3. Redirige al dashboard. |
| **Alternativo** | Si olvida la contraseña, puede solicitar un correo de restablecimiento. |

### 2. Ver Saldo Disponible

| Campo | Detalle |
|---|---|
| **Actor** | Usuario autenticado |
| **Descripción** | El usuario visualiza su saldo actual en la billetera (almacenado en DB local). |
| **Regla** | El saldo disponible es independiente del saldo de MT4. Refleja únicamente los fondos registrados en la base de datos local. |

### 3. Depositar Fondos

| Campo | Detalle |
|---|---|
| **Actor** | Usuario autenticado |
| **Descripción** | El usuario incrementa su saldo disponible mediante un depósito. |
| **Precondición** | Monto > 0. |
| **Postcondición** | El saldo disponible aumenta en el monto indicado. Se registra una transacción de tipo "deposit". |

### 4. Retirar Fondos (a saldo disponible)

| Campo | Detalle |
|---|---|
| **Actor** | Usuario autenticado |
| **Descripción** | El usuario disminuye su saldo disponible. |
| **Precondición** | Monto > 0 y monto <= saldo disponible. |
| **Postcondición** | El saldo disponible disminuye en el monto indicado. Se registra una transacción de tipo "withdraw". |

### 5. Invertir en el Mercado

| Campo | Detalle |
|---|---|
| **Actor** | Usuario autenticado |
| **Descripción** | El usuario transfiere fondos desde su saldo disponible a una inversión con una estrategia específica. |
| **Precondición** | Monto > 0, monto <= saldo disponible, estrategia válida. |
| **Postcondición** | El saldo disponible disminuye. El monto invertido (`investedAmount`) aumenta. Se crea un registro de inversión. |
| **Estrategias** | **Conservador** (70% TNA, riesgo bajo), **Moderado** (95% TNA, riesgo medio), **Agresivo** (140% TNA, riesgo alto). |

### 6. Retirar Inversión

| Campo | Detalle |
|---|---|
| **Actor** | Usuario autenticado |
| **Descripción** | El usuario retira el total de su monto invertido y lo devuelve al saldo disponible. |
| **Precondición** | `investedAmount` > 0. |
| **Postcondición** | `investedAmount` se reduce a 0 (o al monto retirado). El saldo disponible aumenta en el mismo monto. Se registra una transacción de tipo "withdraw". |

### 7. Cambiar Estrategia

| Campo | Detalle |
|---|---|
| **Actor** | Usuario autenticado |
| **Descripción** | El usuario cambia la estrategia de rendimiento de su billetera. |
| **Regla** | La estrategia seleccionada define la tasa de interés diaria aplicada al saldo disponible durante la simulación. |

### 8. Simular un Día

| Campo | Detalle |
|---|---|
| **Actor** | Administrador (`ROLE_ADMIN`) |
| **Descripción** | El administrador avanza la simulación un día para todos los usuarios. |
| **Postcondición** | Se aplica el interés diario de la estrategia de cada usuario. Se actualizan wallets, inversiones y snapshots. Se registra una transacción de tipo "interest". |

### 9. Simulación Rápida (Auto)

| Campo | Detalle |
|---|---|
| **Actor** | Administrador |
| **Descripción** | El administrador activa una simulación automática que avanza 1 día cada 600 ms. |
| **Regla** | Solo visible para usuarios con rol ADMIN. |

### 10. Ver Proyección de Crecimiento

| Campo | Detalle |
|---|---|
| **Actor** | Usuario autenticado |
| **Descripción** | El usuario visualiza en un gráfico la proyección de su saldo en un horizonte de días seleccionable (10 a 365 días). |
| **Regla** | La proyección se calcula en base a la estrategia activa y el saldo actual, aplicando la tasa diaria sin volatilidad. |

### 11. Ver Actividad de Cuenta

| Campo | Detalle |
|---|---|
| **Actor** | Usuario autenticado |
| **Descripción** | El usuario visualiza el historial de transacciones (depósitos, retiros, intereses). |
| **Regla** | Las transacciones se muestran ordenadas por ID descendente. |

### 12. Ver Estado de MT4

| Campo | Detalle |
|---|---|
| **Actor** | Usuario autenticado |
| **Descripción** | El usuario visualiza el estado de conexión con MetaTrader 4 y los detalles de la cuenta (Equity, Profit, Margen). |
| **Regla** | El balance de MT4 se muestra en "Valor Actual" de inversiones. Es independiente del saldo disponible de la billetera. Se muestra además la diferencia entre Valor Actual y Monto Invertido. |

---

## Modelo de Datos

### WalletState (Entidad Principal)

| Campo | Tipo | Descripción |
|---|---|---|
| `uid` | String (PK) | ID del usuario (Firebase UID) |
| `balance` | double | Saldo disponible en la billetera |
| `investedAmount` | double | Monto total invertido |
| `totalEarnings` | double | Ganancias totales acumuladas |
| `currentStrategy` | String | Estrategia activa (conservative, moderate, aggressive) |
| `todayEarnings` | double | Ganancias del día actual |
| `simulatedDaysCount` | int | Días simulados |

### Investment

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Long (PK) | ID autoincremental |
| `uid` | String | ID del usuario |
| `amount` | double | Monto invertido inicial |
| `strategy` | String | Estrategia de la inversión |
| `startDate` | String | Fecha de inicio |
| `currentValue` | double | Valor actual de la inversión |
| `status` | String | Estado (active, closed) |
| `totalReturns` | double | Retornos totales generados |

### Transaction

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Long (PK) | ID autoincremental |
| `uid` | String | ID del usuario |
| `type` | String | deposit, withdraw, interest |
| `title` | String | Descripción de la transacción |
| `amount` | double | Monto |
| `date` | String | Fecha formateada |
| `isFresh` | boolean | Indica si es una transacción reciente |

---

## Reglas Transversales

1. **Persistencia**: Todos los balances y estados se persisten en PostgreSQL.
2. **Autenticación**: Toda operación requiere un token JWT válido de Firebase Auth.
3. **MT4**: La conexión con MetaTrader es optativa. Si no está disponible, el sistema opera con datos locales.
4. **Snapshots**: Cada vez que se modifica el balance, se guarda un snapshot histórico para cálculos de rendimiento a 30 días.
5. **Interés Compuesto**: El interés diario se calcula sobre el saldo disponible usando la tasa de la estrategia activa.
