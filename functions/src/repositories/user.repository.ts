import { db } from '../utils/firebase';
import { User } from '../models/user.model';

export class UserRepository {
  private usersCollection = db.collection('users');

  /**
   * Busca un usuario por su correo electrónico
   * @param email Correo electrónico del usuario
   * @returns Promise con el usuario si existe, null si no existe
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const querySnapshot = await this.usersCollection
        .where('email', '==', email)
        .get();
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const userData = doc.data() as User;
      userData.id = doc.id;
      
      return userData;
    } catch (error) {
      console.error('Error al buscar usuario por email:', error);
      throw new Error('Error al buscar usuario por email');
    }
  }

  /**
   * Crea un nuevo usuario en Firestore
   * @param user Datos del usuario a crear
   * @returns Promise con el usuario creado
   */
  async create(user: User): Promise<User> {
    try {
      // Si no se proporciona un ID, usamos el autogenerado por Firestore
      const userToCreate = {
        email: user.email,
        createdAt: user.createdAt || new Date().toISOString()
      };
      
      let docRef;
      if (user.id) {
        // Si viene un ID, usamos ese documento específico
        docRef = this.usersCollection.doc(user.id);
        await docRef.set(userToCreate);
        return {
          ...userToCreate,
          id: user.id
        }
      } else {
        // Si no viene ID, dejamos que Firestore asigne uno automáticamente
        docRef = await this.usersCollection.add(userToCreate);
        return {
          ...userToCreate,
          id: docRef.id
        }
      }
      
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw new Error('Error al crear usuario');
    }
  }

  /**
   * Obtiene un usuario por su ID
   * @param id ID del usuario
   * @returns Promise con el usuario si existe, null si no existe
   */
  async findById(id: string): Promise<User | null> {
    try {
      const userDoc = await this.usersCollection.doc(id).get();
      
      if (!userDoc.exists) {
        return null;
      }
      
      const userData = userDoc.data() as User;
      userData.id = userDoc.id;
      
      return userData;
    } catch (error) {
      console.error('Error al obtener usuario por ID:', error);
      throw new Error('Error al obtener usuario por ID');
    }
  }
}